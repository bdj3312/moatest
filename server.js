import express from 'express';
import got from 'got';
import cors from 'cors';
const port = 4242;

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/confirm", function (req, res) {
  // 클라이언트에서 받은 JSON 요청 바디입니다.
  const { paymentKey, orderId, amount } = req.body;
  

  // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
  // 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
  const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
  const encryptedSecretKey =
    "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

  // 결제를 승인하면 결제수단에서 금액이 차감돼요.
  got
    .post("https://api.tosspayments.com/v1/payments/confirm", {
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      json: {
        orderId: orderId,
        amount: amount,
        paymentKey: paymentKey,
      },
      responseType: "json",
    })
    .then(function (response) {
      const responseBody = response.body;
      const totalAmount = responseBody.totalAmount;

      // amount를 숫자로 변환
      const parsedAmount = Number(amount);

      
      

      if (parsedAmount === totalAmount) {
        console.log("결제 금액 일치");
        res.status(response.statusCode).json(responseBody);
      } else {
        console.log("결제 금액 불일치");
        res.status(400).json({ error: "금액이 맞지 않습니다." });
      }
    })
    .catch(function (error) {
      console.log(error.response.body);
      res.status(error.response.statusCode).json(error.response.body)
    });
});

app.listen(port, () =>
  console.log(`http://localhost:${port} 으로 앱이 실행되었습니다.`)
);