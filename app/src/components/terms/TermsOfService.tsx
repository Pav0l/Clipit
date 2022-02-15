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

        {/* Introduction */}
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
                (collectively, the “Site” or the ”Service”).
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

        {/* Modifications to the Service */}
        <Section>
          <SectionHeader text="Modifications to the Service" />

          <SectionParagraph
            text={
              <>
                We reserve the right in our sole discretion to modify, suspend, or discontinue, temporarily or
                permanently, the Service (or any features or parts thereof) at any time and without liability as a
                result.
              </>
            }
          />
        </Section>

        {/* Disclaimers - mb merged with something else */}
        <Section>
          <SectionHeader text="Disclaimers" />

          <SectionParagraph
            text={
              <>
                The Service is provided on an as-is and as-available basis. We do not represent and warrant that access
                to the Service will be continuous, uninterrupted, timely, or secure; that the information contained in
                the Service will be accurate, reliable, complete, or current; or that the Service will be free from
                errors, defects, viruses, or other harmful elements.
              </>
            }
          />

          <SectionParagraph
            text={
              <>
                We will not be responsible or liable to you for any loss and take no responsibility for, and will not be
                liable to you for, any use of NFTs, content, and/or content linked to or associated with NFTs, including
                but not limited to any losses, damages, or claims arising from: (a) user error, incorrectly constructed
                transactions, or mistyped addresses; (b) server failure or data loss; (c) unauthorized access or use;
                (d) any unauthorized third-party activities, including without limitation the use of viruses, phishing,
                bruteforcing or other means of attack against the service or NFTs.
              </>
            }
            marginTop
          />
        </Section>

        {/* Assumption of Risk */}
        <Section>
          <SectionHeader text="Assumption of Risk" />

          <SectionParagraph
            text={
              <>
                You accept and acknowledge that there are risks associated with holding or using NFTs and using the
                Ethereum network, including but not limited to, the risk of losing access to your Ethereum address due
                to loss of private keys, seed words or other credentials, or an unauthorized third party gaining access
                to same, and the risk of unknown vulnerabilities in the the token smart contract code or the Ethereum
                network protocol. You agree to take all reasonable steps to protect your wallet credentials including
                passwords, pin codes, access to your devices for SMS or multi-factor authentication. You acknowledge and
                accept all such risks described in this paragraph and release us completely from all liability that may
                arise as a result of any one or more of these things occuring. You accept and acknowledge that we will
                not be responsible for any losses, failures, disruptions, errors, distortions, or delays you may
                experience when minting, bidding, holding, accepting bids, or otherwise using the Service however
                caused.
              </>
            }
          />

          <SectionParagraph
            marginTop
            text={
              <>
                The prices of blockchain assets are extremely volatile and we cannot guarantee assets value. You are
                solely responsible for determining any taxes that apply to your transactions. You accept responsibility
                for any risks associated with purchasing user-generated content, including (but not limited to) the risk
                of purchasing counterfeit assets, mislabeled assets, assets that are vulnerable to metadata decay,
                assets on faulty smart contracts, and assets that may become untransferable.
              </>
            }
          />
        </Section>
      </Container>
    </CenteredContainer>
  );
}
