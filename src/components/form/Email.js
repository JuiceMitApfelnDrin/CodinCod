import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";

export const Email = ({
  errors,
  values,
  handleBlur,
  handleChange,
  touched,
  description,
}) => {
  return (
    <FormControl isInvalid={errors.email}>
      <FormLabel>Email</FormLabel>
      <FormHelperText mb={1}>{description}</FormHelperText>
      <Input
        type="email"
        name="email"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.email}
      />
      {errors.email && touched.email && (
        <FormErrorMessage>{errors.email}</FormErrorMessage>
      )}
    </FormControl>
  );
};
