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

        <SectionParagraph text={<>Last updated: DD.MM.YYYY</>} />

        <Section>
          <SectionHeader text="Introduction" />
          <SectionParagraph
            text={
              <>
                ClipIt is an NFT marketplace maintained by a decentralized team of developers (&quot;ClipIt&quot;). It
                is build on top of{" "}
                <a href="https://zora.co/" target="_blank" rel="noreferrer">
                  Zora Market and AuctionHouse
                </a>
                , an NFT Marketplace Protocol on the Ethereum blockchain.
              </>
            }
          />

          <SectionParagraph
            text={
              <>
                These Terms of Service (“Terms”) govern your access to and use of the ClipIt website, our APIs and any
                other software, tools, features, or functionalities provided on or in connection with our services
                (collectively, the “Site”).
              </>
            }
            marginTop
          />

          <SectionParagraph
            text={
              <>
                We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Service
                at any time and for any reason. We will alert you about any changes by updating the “Last updated” date
                of these Terms, and you waive any right to receive specific notice of each such change. It is your
                responsibility to periodically review these Terms to stay informed of updates. You will be subject to,
                and will be deemed to have been made aware of and to have accepted, the changes in any revised Terms by
                your continued use of the Site after the date such revised Terms are posted.
              </>
            }
            marginTop
          />
        </Section>
      </Container>
    </CenteredContainer>
  );
}
