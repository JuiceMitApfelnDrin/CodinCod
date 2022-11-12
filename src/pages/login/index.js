import { BACKEND_URLS, URLS } from "constants/urls";
import { Button, HStack, Text, VStack } from "@chakra-ui/react";

import { Formik } from "formik";
import GeneralLayout from "layouts/GeneralLayout";
import { Nickname } from "components/form/Nickname";
import { Password } from "components/form/Password";
import axios from "axios";

const Index = () => {
  return (
    <GeneralLayout>
      <Text fontSize="3xl">Welcome to the club</Text>

      <Formik
        initialValues={{ nickname: "", email: "", password: "" }}
        onSubmit={async (values) => {
          // FIXME: form doesn't work yet

          return axios
            .post(BACKEND_URLS.LOGN, JSON.stringify(values))
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

              {/* password */}
              <Password
                description="Enter a password."
                errors={errors}
                handleBlur={handleBlur}
                handleChange={handleChange}
                touched={touched}
                values={values}
              />

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
