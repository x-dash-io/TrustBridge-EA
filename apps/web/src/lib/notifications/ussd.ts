export interface UssdRequest {
  phoneNumber: string;
  sessionId: string;
  serviceCode: string;
  text: string;
}

export interface UssdResponse {
  response: string;
  type: "response" | "termination";
}

export function handleUssdSession(request: UssdRequest): UssdResponse {
  const { text } = request;

  if (text === "") {
    return {
      response: "CON Welcome to TrustBridge Escrow\n1. Check Transaction Status\n2. Approve Milestone Release\n3. Recent Activity",
      type: "response",
    };
  }

  const parts = text.split("*");
  const option = parts[0];

  switch (option) {
    case "1":
      return {
        response: "CON Enter transaction reference (TRX-XXXXX):",
        type: "response",
      };
    case "2":
      return {
        response: "CON Enter transaction reference to approve:",
        type: "response",
      };
    default:
      return {
        response: "END Invalid option. Please try again.",
        type: "termination",
      };
  }
}
