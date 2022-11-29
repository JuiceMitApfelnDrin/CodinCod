import { Select } from "@chakra-ui/react";

const Header = () => {
  return (
    <>
      <div> Header ding</div>
      <Select placeholder="first language">
        <option value="option1">language 1</option>
      </Select>
    </>
  );
};

export default Header;
