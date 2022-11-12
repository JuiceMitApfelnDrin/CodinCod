import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";

export const Nickname = ({
  errors,
  values,
  handleBlur,
  handleChange,
  touched,
  description
}) => {
  return (
    <FormControl isInvalid={errors.nickname}>
      <FormLabel>Nickname</FormLabel>
      <FormHelperText mb={1}>{description}</FormHelperText>
      <Input
        type="text"
        name="nickname"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.nickname}
      />
      {errors.nickname && touched.nickname && (
        <FormErrorMessage>{errors.nickname}</FormErrorMessage>
      )}
    </FormControl>
  );
};
