import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import { useState } from "react";

export const Password = ({
  errors,
  values,
  handleBlur,
  handleChange,
  touched,
  description,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormControl isInvalid={errors.password}>
      <FormLabel>Password</FormLabel>
      <FormHelperText mb={1}>{description}</FormHelperText>
      <InputGroup size="md">
        <Input
          autoComplete=""
          name="password"
          type={showPassword ? "text" : "password"}
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.password}
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
      {errors.password && touched.password && (
        <FormErrorMessage>{errors.password}</FormErrorMessage>
      )}
    </FormControl>
  );
};
