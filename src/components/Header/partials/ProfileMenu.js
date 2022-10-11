import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import urls from "constants/urls";

const profileMenuOptions = [
  { icon: "", label: "Profile", href: urls.PROFILE },
  { icon: "", label: "Inbox", href: urls.INBOX },
  { icon: "", label: "Preferences", href: urls.PREFERENCES },
  { icon: "", label: "Sign out", href: urls.SIGN_OUT },
];

export const ProfileMenu = ({ name, src }) => {
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
        <Avatar name={name} src={src} />
      </MenuButton>
      <MenuList>
        {profileMenuOptions.map((option) => (
          <MenuItem key={option.label} as={"a"} href={option.href}>
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
