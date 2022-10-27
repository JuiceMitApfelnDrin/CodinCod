import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import { BellIcon } from "@chakra-ui/icons";
import { UserContext } from "providers/UserProvider";
import { useContext } from "react";

export const NotificationMenu = () => {
  const { notifications } = useContext(UserContext);

  return (
    <Menu>
      <MenuButton
        as="button"
        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
        borderRadius="full"
        _focus={{
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
        }}
      >
        <BellIcon w={6} h={6} />
      </MenuButton>
      <MenuList>
        {notifications.map((notification, index) => {
          return <MenuItem key={index}>{notification.text}</MenuItem>;
        })}
      </MenuList>
    </Menu>
  );
};
