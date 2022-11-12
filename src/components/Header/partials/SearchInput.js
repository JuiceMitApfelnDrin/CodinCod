import {
  Box,
  Divider,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import React, { useState } from "react";

import Link from "next/link";
import { Search2Icon } from "@chakra-ui/icons";
import { URLS } from "constants/urls";
import { useOutsideClick } from "@chakra-ui/react";

export const SearchInput = ({ value, onChange, list = [] }) => {
  const [showList, setShowList] = useState(false);

  const ref = React.useRef();
  useOutsideClick({
    ref: ref,
    handler: () => setShowList(false),
  });

  return (
    <Box ref={ref}>
      <InputGroup>
        <Input
          placeholder="Search"
          value={value}
          onFocus={() => setShowList(true)}
          onChange={(e) => {
            setShowList(!!e.target.value);
            onChange(e);
          }}
        />
        <InputRightAddon children={<Search2Icon />} />
      </InputGroup>
      {showList && list.length > 0 && (
        <Box
          pos="absolute"
          bg="black"
          border="2px"
          borderRadius="6.9"
          borderColor="gray.600"
          mt="1rem"
        >
          {list.map((val) => {
            return (
              <Box>
                <Link href={URLS.PROFILE + (val.id || val._id)}>
                  <Box
                    as="span"
                    _hover={{
                      background: "gray.600",
                    }}
                    display="flex"
                    alignContent="center"
                    px="1rem"
                    py="0.5rem"
                    onClick={() => {
                      setShowList(false);
                    }}
                  >
                    {/* TODO: when users have profile pictures add their profile picture before their name */}
                    {/* <Image
                boxSize="2rem"
                borderRadius="full"
                src="https://placekitten.com/100/100"
                alt="Fluffybuns the destroyer"
                mr="12px"
              /> */}
                    {val.nickname}
                  </Box>
                </Link>
                <Divider />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
