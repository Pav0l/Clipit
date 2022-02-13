import { Container, Typography } from "@material-ui/core";
import CenteredContainer from "../container/CenteredContainer";
import { SectionHeader, Section, SectionParagraph } from "../section/Section";

export default function TermsOfService() {
  return (
    <CenteredContainer>
      <Container>
        <Typography variant="h4" component="h4">
          Terms of Service
        </Typography>

        <Section>
          <SectionHeader text="Introduction" />
          <SectionParagraph
            text={
              <>
                ClipIt is an NFT marketplace maintained by a decentralized team of developers. It is build on top of{" "}
                <a href="https://zora.co/" target="_blank" rel="noreferrer">
                  Zora Market and AuctionHouse
                </a>
                , an NFT Martekplace Protocol on the Ethereum blockchain.
              </>
            }
          />
        </Section>

        <Section>
          <SectionHeader text="Another section" />
          <SectionParagraph
            text={
              <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
                id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                in culpa qui officia deserunt mollit anim id est laborum.
              </>
            }
          />
        </Section>
      </Container>
    </CenteredContainer>
  );
}
