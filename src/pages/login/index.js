import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BACKEND_URLS, URLS } from "utils/constants/urls";

import { ALERT_OPTIONS } from "utils/constants/alert";
import { Formik } from "formik";
import GeneralLayout from "layouts/GeneralLayout";
import { Nickname } from "components/form/Nickname";
import { Password } from "components/form/Password";
import axios from "axios";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();

  return (
    <GeneralLayout>
      <Text fontSize="3xl">Welcome to the club</Text>

      <Formik
        initialValues={{ nickname: "", email: "", password: "" }}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          return axios
            .post(BACKEND_URLS.LOGIN, JSON.stringify(values))
            .then((res) => {
              // FIXME: redirect to home
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

              {/* password */}
              <Password
                description="Enter a password."
                errors={errors}
                handleBlur={handleBlur}
                handleChange={handleChange}
                touched={touched}
                values={values}
              />

              {errors.general && (
                <Alert status={ALERT_OPTIONS.ERROR}>
                  <AlertIcon />
                  <AlertTitle>An error occurred</AlertTitle>
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <HStack gap={2}>
                <Button as="a" href={URLS.REGISTER}>
                  Register
                </Button>
                <Button
                  background="blue.700"
                  _hover={{ background: "blue.900" }}
                  type="submit"
                  disabled={isSubmitting}
                >
                  Login
                </Button>
              </HStack>
            </VStack>
          </form>
        )}
      </Formik>
    </GeneralLayout>
  );
};

export default Index;
