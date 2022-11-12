import { Button, Text, VStack } from "@chakra-ui/react";

import { BACKEND_URLS } from "constants/urls";
import { Email } from "components/form/Email";
import { Formik } from "formik";
import GeneralLayout from "layouts/GeneralLayout";
import { Nickname } from "components/form/Nickname";
import { Password } from "components/form/Password";
import axios from "axios";
import { validate } from "email-validator";

const Index = () => {
  return (
    <GeneralLayout>
      <Text fontSize="3xl">Welcome to the club</Text>

      <Formik
        initialValues={{ nickname: "", email: "", password: "" }}
        validate={(values) => {
          const errors = {};
          if (!values.nickname.match(/.+/)) {
            errors.nickname = "Nickname is required";
          }
          if (!values.email) {
            errors.email = "Required";
          } else if (!validate(values.email)) {
            errors.email = "Invalid email address";
          }

          if (!values.password) {
            errors.password = "Required";
          } else if (!values.password.match(/.{8,256}/)) {
            errors.password = "Password must be at least 8 characters";
          }
          return errors;
        }}
        onSubmit={async (values) => {
          // FIXME: form doesn't work yet

          return axios
            .post(BACKEND_URLS.REGISTER, JSON.stringify(values))
            .then((res) => {
              console.log(res);
            })
            .catch((ding) => {
              console.log(ding);
            });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <VStack gap={6}>
              {/* nickname */}
              <Nickname
                description="Enter your desired nickname."
                errors={errors}
                handleBlur={handleBlur}
                handleChange={handleChange}
                touched={touched}
                values={values}
              />

              {/* email */}
              <Email
                description="Enter your email."
                errors={errors}
                handleBlur={handleBlur}
                handleChange={handleChange}
                touched={touched}
                values={values}
              />

              {/* password */}
              <Password
                description="Enter a password."
                errors={errors}
                handleBlur={handleBlur}
                handleChange={handleChange}
                touched={touched}
                values={values}
              />

              <Button
                background="blue.700"
                _hover={{ background: "blue.900" }}
                type="submit"
                disabled={isSubmitting}
              >
                Register
              </Button>
            </VStack>
          </form>
        )}
      </Formik>
    </GeneralLayout>
  );
};

export default Index;
