import { Avatar, Box } from "@chakra-ui/react";

export const AvatarButton = ({ name, src }) => {
  return (
    <Box
      as="button"
      transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
      borderRadius="full"
      _focus={{
        boxShadow:
          "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
      }}
    >
      <Avatar name={name} src={src} />
    </Box>
  );
};
