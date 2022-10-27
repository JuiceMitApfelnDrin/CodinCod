import {
  AddIcon,
  ChatIcon,
  LinkIcon,
  MinusIcon,
  NotAllowedIcon,
} from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  ButtonGroup,
  HStack,
  Heading,
  IconButton,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";

import GeneralLayout from "layouts/GeneralLayout";
import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { UserContext } from "providers/UserProvider";
import { useContext } from "react";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;

  const { username, avatar, location, isFollowing, socials } =
    useContext(UserContext);

  return (
    <GeneralLayout>
      <HStack w="85%">
        <VStack
          gap="1rem"
          bg="black"
          border="2px"
          borderRadius="6.9"
          borderColor="gray.600"
          p="8"
          m="8"
        >
          <Avatar name={username} src={avatar} width="10rem" height="10rem" />

          <Heading fontSize="md" as="h2">
            {username}
          </Heading>
          <ButtonGroup py="2" size="sm" isAttached variant="outline">
            {isFollowing(id) ? (
              <Tooltip label="Remove from friends">
                <IconButton
                  aria-label="Remove from friends"
                  icon={<MinusIcon />}
                />
              </Tooltip>
            ) : (
              <Tooltip label="Add to friends">
                <IconButton aria-label="Add to friends" icon={<AddIcon />} />
              </Tooltip>
            )}
            <Tooltip label="Block">
              <IconButton aria-label="Block" icon={<NotAllowedIcon />} />
            </Tooltip>
            <Tooltip label="Message">
              <IconButton aria-label="Send a message" icon={<ChatIcon />} />
            </Tooltip>
          </ButtonGroup>
          <VStack w="full">
            <Box display="flex" flexDir="row">
              <MapPinIcon width="1rem" height="1rem" />
              <Text ml="2">{location}</Text>
            </Box>
            {socials &&
              socials.map((social) => {
                return (
                  <Link href={social.url} flexDir="row">
                    <Box display="flex">
                      <LinkIcon width="1rem" height="1rem" />
                      <Text ml="2">{social.text}</Text>
                    </Box>
                  </Link>
                );
              })}
          </VStack>
        </VStack>
        <VStack
          w="full"
          gap="1rem"
          bg="black"
          border="2px"
          borderRadius="6.9"
          borderColor="gray.600"
          p="8"
          m="8"
        >
          <Box>this is a profile with {id}</Box>
        </VStack>
      </HStack>
    </GeneralLayout>
  );
};

export default Index;
