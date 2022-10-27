import { BACKEND_URLS, URLS } from "constants/urls";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useCallback, useState } from "react";

import GeneralLayout from "layouts/GeneralLayout";
import axios from "axios";
import { validate } from "email-validator";

const Index = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registrationInformation, setRegistrationInformation] = useState({
    nickname: "",
    password: "",
    email: "",
  });
  const [invalid, setInvalid] = useState({
    nickname: true,
    password: true,
    email: true,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    console.log(event);
    axios
      .post(BACKEND_URLS.register, JSON.stringify(registrationInformation))
      .then((res) => {
        console.log(res);
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };

  return (
    <GeneralLayout>
      <Text fontSize="3xl">Welcome to the club</Text>

      <form onSubmit={handleSubmit}>
        <VStack gap={6}>
          {/* nickname */}
          <FormControl isInvalid={invalid.nickname}>
            <FormLabel>Nickname</FormLabel>
            <FormHelperText mb={1}>Enter your desired nickname.</FormHelperText>
            <Input
              type="text"
              value={registrationInformation.nickname}
              onChange={(e) => {
                setInvalid({
                  ...invalid,
                  nickname: !e.target.value.match(/.+/),
                }); // && TODO: add a way to check if username is taken or not
                setRegistrationInformation({
                  ...registrationInformation,
                  nickname: e.target.value,
                });
              }}
            />
            <FormErrorMessage>Nickname is a required field.</FormErrorMessage>
          </FormControl>

          {/* email */}
          <FormControl isInvalid={invalid.email}>
            <FormLabel>Email</FormLabel>
            <FormHelperText mb={1}>Enter your email.</FormHelperText>
            <Input
              type="email"
              value={registrationInformation.email}
              onChange={(e) => {
                setInvalid({
                  ...invalid,
                  email: !validate(e.target.value), // true,
                });
                setRegistrationInformation({
                  ...registrationInformation,
                  email: e.target.value,
                });
              }}
            />

            <FormErrorMessage>Email is a required field.</FormErrorMessage>
          </FormControl>

          {/* password */}
          <FormControl isInvalid={invalid.password}>
            <FormLabel>Password</FormLabel>
            <FormHelperText mb={1}>Enter your desired password.</FormHelperText>
            <InputGroup size="md">
              <Input
                autoComplete=""
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={registrationInformation.password}
                onChange={(e) => {
                  setInvalid({
                    ...invalid,
                    password: !e.target.value.match(/.{8,256}/),
                  });
                  setRegistrationInformation({
                    ...registrationInformation,
                    password: e.target.value,
                  });
                }}
              />
              <InputRightElement>
                <Button
                  h="1.75rem"
                  size="xs"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>Password is a required field.</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            disabled={
              submitting ||
              invalid.nickname ||
              invalid.email ||
              invalid.password
            }
          >
            Register
          </Button>
        </VStack>
      </form>
    </GeneralLayout>
  );
};

export default Index;
