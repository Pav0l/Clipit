import { isValidEmail } from "./email";

it("validates email", () => {
  // valid emails
  expect(isValidEmail("email@example.com")).toBeTruthy();
  expect(isValidEmail("firstname.lastname@example.com")).toBeTruthy();
  expect(isValidEmail("email@subdomain.example.com")).toBeTruthy();
  expect(isValidEmail("firstname+lastname@example.com")).toBeTruthy();
  expect(isValidEmail('"email"@example.com')).toBeTruthy();
  expect(isValidEmail("1234567890@example.com")).toBeTruthy();
  expect(isValidEmail("email@example-one.com")).toBeTruthy();
  expect(isValidEmail("_______@example.com")).toBeTruthy();
  expect(isValidEmail("email@example.name")).toBeTruthy();
  expect(isValidEmail("email@example.museum")).toBeTruthy();
  expect(isValidEmail("email@example.co.jp")).toBeTruthy();
  expect(isValidEmail("firstname-lastname@example.com")).toBeTruthy();

  // invalid emails
  expect(isValidEmail("mysite.ourearth.com")).toBeFalsy();
  expect(isValidEmail("mysite@.com.my")).toBeFalsy();
  expect(isValidEmail("@you.me.net")).toBeFalsy();
  expect(isValidEmail("mysite123@gmail.b")).toBeFalsy();
  expect(isValidEmail("mysite@.org.org")).toBeFalsy();
  expect(isValidEmail(".mysite@mysite.org")).toBeFalsy();
  expect(isValidEmail("mysite()*@gmail.com")).toBeFalsy();
  expect(isValidEmail("mysite..1234@yahoo.com")).toBeFalsy();
});
