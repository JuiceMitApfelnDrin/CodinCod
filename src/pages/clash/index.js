import Footer from "./partials/Footer";
import GeneralLayout from "layouts/GeneralLayout";
import Header from "./partials/Header";
import Main from "./partials/Main";

const Index = () => {
  return (
    <GeneralLayout>
      <Header />
      <Main />
      <Footer />
    </GeneralLayout>
  );
};

export default Index;
