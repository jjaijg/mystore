import { generateAccessToken, paypal } from "../lib/paypal";

// Test to generate access token from paypal
test("Generate a token from paypal", async () => {
  const resp = await generateAccessToken();
  console.log(resp);
  expect(typeof resp).toBe("string");
  expect(resp.length).toBeGreaterThan(0);
});

// Test to create a paypal order
test("creates a paypal order", async () => {
  // const token = await generateAccessToken();
  const price = 10.0;

  const orderResp = await paypal.createOrder(price);
  console.log(orderResp);

  expect(orderResp).toHaveProperty("id");
  expect(orderResp).toHaveProperty("status");
  expect(orderResp.status).toBe("CREATED");
});

// Test to capture payment with a mock order
test("Simulate capturing a payment from an order", async () => {
  const orderId = "100";

  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({
      status: "COMPLETED",
    });

  const captureResp = await paypal.capturePayment(orderId);
  console.log(captureResp);

  expect(captureResp).toHaveProperty("status");
  expect(captureResp.status).toBe("COMPLETED");

  mockCapturePayment.mockRestore();
});
