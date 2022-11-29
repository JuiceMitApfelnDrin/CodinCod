import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BACKEND_URLS, URLS } from "utils/constants/urls";
import { Router, useRouter } from "next/router";

import { ALERT_OPTIONS } from "utils/constants/alert";
import { Email } from "components/form/Email";
import { Formik } from "formik";
import GeneralLayout from "layouts/GeneralLayout";
import { Nickname } from "components/form/Nickname";
import { Password } from "components/form/Password";
import axios from "axios";
import { validate } from "email-validator";

const Index = () => {
  const router = useRouter();

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
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          return axios
            .post(BACKEND_URLS.REGISTER, JSON.stringify(values))
            .then((res) => {
              // FIXME: redirect to home if the user is logged in
              // else redirect to login
            })
            .catch(({ response }) => {
              setFieldError("general", response.data);
            })
            .finally(() => {
              setSubmitting(false);
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

              {/* FIXME: find a better way to handle backend errors */}
              {errors.general && (
                <Alert status={ALERT_OPTIONS.ERROR}>
                  <AlertIcon />
                  <AlertTitle>An error occurred</AlertTitle>
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

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
