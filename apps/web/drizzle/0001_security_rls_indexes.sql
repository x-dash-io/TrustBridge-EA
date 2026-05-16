-- Operational indexes for auth-scoped reads and financial reconciliation.
CREATE INDEX IF NOT EXISTS transactions_created_by_idx ON transactions(created_by);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS transactions_updated_at_idx ON transactions(updated_at);
CREATE INDEX IF NOT EXISTS transaction_parties_transaction_idx ON transaction_parties(transaction_id);
CREATE INDEX IF NOT EXISTS transaction_parties_user_idx ON transaction_parties(user_id);
CREATE INDEX IF NOT EXISTS milestones_transaction_idx ON milestones(transaction_id);
CREATE INDEX IF NOT EXISTS milestones_status_idx ON milestones(status);
CREATE INDEX IF NOT EXISTS milestones_auto_release_idx ON milestones(auto_release_eligible_at, status);
CREATE INDEX IF NOT EXISTS payments_transaction_idx ON payments(transaction_id);
CREATE UNIQUE INDEX IF NOT EXISTS payments_checkout_request_idx ON payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS disbursements_transaction_idx ON disbursements(transaction_id);
CREATE INDEX IF NOT EXISTS disbursements_milestone_idx ON disbursements(milestone_id);
CREATE UNIQUE INDEX IF NOT EXISTS disbursements_provider_reference_idx ON disbursements(provider_reference);
CREATE INDEX IF NOT EXISTS kyc_submissions_user_idx ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS kyc_submissions_status_idx ON kyc_submissions(status);
CREATE INDEX IF NOT EXISTS kyc_submissions_document_blind_idx ON kyc_submissions(document_number_blind_index);
CREATE INDEX IF NOT EXISTS disputes_transaction_idx ON disputes(transaction_id);
CREATE INDEX IF NOT EXISTS disputes_milestone_idx ON disputes(milestone_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx ON disputes(status);
CREATE INDEX IF NOT EXISTS audit_log_transaction_idx ON audit_log(transaction_id);
CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON audit_log(actor_id);

-- Supabase RLS: service role still bypasses RLS, but authenticated user clients
-- are constrained to own user rows and transaction-party scoped records.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_ndas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_own_select ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_own_update ON users
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY transaction_creator_or_party_select ON transactions
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM transaction_parties tp
      WHERE tp.transaction_id = transactions.id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY transaction_creator_insert ON transactions
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY transaction_parties_scoped_select ON transaction_parties
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_parties.transaction_id
        AND t.created_by = auth.uid()
    )
  );

CREATE POLICY milestones_party_select ON milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transaction_parties tp
      WHERE tp.transaction_id = milestones.transaction_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY payments_party_select ON payments
  FOR SELECT USING (
    payer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM transaction_parties tp
      WHERE tp.transaction_id = payments.transaction_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY disbursements_recipient_select ON disbursements
  FOR SELECT USING (
    recipient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM transaction_parties tp
      WHERE tp.transaction_id = disbursements.transaction_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY kyc_submissions_own_select ON kyc_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY disputes_party_select ON disputes
  FOR SELECT USING (
    opened_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM transaction_parties tp
      WHERE tp.transaction_id = disputes.transaction_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY dispute_messages_party_select ON dispute_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN transaction_parties tp ON tp.transaction_id = d.transaction_id
      WHERE d.id = dispute_messages.dispute_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY dispute_evidence_party_select ON dispute_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN transaction_parties tp ON tp.transaction_id = d.transaction_id
      WHERE d.id = dispute_evidence.dispute_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY transaction_messages_party_select ON transaction_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transaction_parties tp
      WHERE tp.transaction_id = transaction_messages.transaction_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY notifications_own_select ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_own_update ON notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_deliveries_own_select ON notification_deliveries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY audit_log_party_select ON audit_log
  FOR SELECT USING (
    actor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM transaction_parties tp
      WHERE tp.transaction_id = audit_log.transaction_id
        AND tp.user_id = auth.uid()
    )
  );
