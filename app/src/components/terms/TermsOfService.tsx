import { Container, Typography } from "@material-ui/core";
import { AppRoute } from "../../lib/constants";
import CenteredContainer from "../container/CenteredContainer";
import { LinkButton } from "../linkButton/LinkButton";
import { SectionHeader, Section, SectionParagraph } from "../section/Section";
import { SimpleList } from "../simpleList/SimpleList";

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
                ClipIt is an NFT marketplace maintained by a decentralized team of developers (&quot;ClipIt&quot;,
                &quot;we&quot;, &quot;us&quot; or &quot;our&quot;). It is build on top of{" "}
                <a href="https://zora.co/" target="_blank" rel="noreferrer">
                  Zora Market and AuctionHouse
                </a>
                , an opensource NFT Marketplace Protocol on the Ethereum blockchain.
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

        {/* Intellectual Property Rights */}
        <Section>
          <SectionHeader text="Intellectual Property Rights" />
          <SectionParagraph
            text={
              <>
                We own the intellectual property of the Service, including (but not limited to) software, text, designs,
                images, and copyrights. We do not own any intellectual property of the Zora Protocol, any tokens or
                user-generated content. The set of smart contracts on the Ethereum blockchain that govern the minting
                and transacting the NFTs are open source and accessible to anyone. Each creator that mints NFTs using
                the Service keeps all intellectual property rights to such content.
              </>
            }
          />
        </Section>

        {/* Privacy */}
        <Section>
          <SectionHeader text="Privacy" />
          <SectionParagraph
            text={
              <>
                When you use the Service, the only information we collect from you is your blockchain wallet address,
                completed transaction hashes, and token identifiers. We do not collect any personal information from
                you. We do, however, use third-party services like Google Analytics, which may receive your publicly
                available personal information. We do not take responsibility for any information you make public on the
                Ethereum blockchain by taking actions through the Service. Please refer to our{" "}
                <LinkButton
                  to={AppRoute.PRIVACY}
                  text="Privacy Policy"
                  className=""
                  setActive={() => null}
                  underline="hover"
                />{" "}
                for information about what data we collect and how we use it.
              </>
            }
          />
        </Section>

        {/* Accessing the Service */}
        <Section>
          <SectionHeader text="Accessing the Service" />
          <SectionParagraph
            text={
              <>
                To access or use the Service, you represent and warrant that you are at least the age of majority in
                your jurisdiction, your access and use of the Service will fully comply with all applicable laws and
                regulations and that you will not access or use the Service to conduct, promote, or otherwise facilitate
                any illegal activity. Furthermore, you represent and warrant that (a) you are not located in a country
                that is subject to a U.S. Government embargo; and (b) you have not been identified as a Specially
                Designated National or placed on any U.S. Government list of prohibited, sanctioned, or restricted
                parties.
              </>
            }
          />
          <SectionParagraph
            text={
              <>
                Your access and use of the Service may be interrupted from time to time for any of several reasons,
                including, without limitation, the malfunction of equipment, periodic updating, maintenance, or repair
                of the Service or other actions that ClipIt, in its sole discretion, may elect to take.
              </>
            }
            marginTop
          />
        </Section>

        {/* Prohibited Activities */}
        <Section>
          <SectionHeader text="Prohibited Activities" />

          <SectionParagraph
            text={
              <>
                As a user of the Site, you agree not to engage in any of the following categories of prohibited activity
                in relation to your access and use of Service:
              </>
            }
          />

          <SimpleList
            listItemTexts={[
              "Infringe or violate the intellectual property rights or any other rights of others, such as violations to copyright, trademark, service mark or patent.",
              "Transacting in any Restricted Territory or interacting with any blockchain addresses controlled indirectly or directly by persons or entities Subject to Restrictions, that is, included in any trade embargoes or sanctions list.",
              "Attempt to impersonate another user or person or use the username of another user without authorization from such user.",
              "Attempt to mint Clips which you are not a Broadcaster of.",
              "Attempt to cryptographically sign messages that would allow you to mint Clips which you are not a Broadcaster of.",
              "Attempt to bypass any measures of the Service designed to prevent or restrict access to the Service, or any portion of the Service including, but not limited to attempting to circumvent any rate limiting systems, directing traffic through multiple IP addresses, or otherwise obfuscating the source of traffic you send to the Service.",
              "Use the Service, including through disseminating any software or interacting with any API, that could damage, disable, overburden, or impair the functioning of the Service in any manner including, but not limited to denial of service attacks.",
              "Use the Service to engage in price manipulation, fraud, or other deceptive, misleading, or manipulative activity.",
              "Use the Service to buy, sell, or transfer stolen items, fraudulently obtained items, items taken without authorization, and/or any other illegally obtained items.",
              "Interaction with assets, listings, smart contracts, and collections that include metadata that may be deemed harmful or illegal, including (but not limited to): metadata that promotes suicide or self-harm, incites hate or violence against others, degrades or doxxes another individual, depicts minors in sexually suggestive situations, or raises funds for terrorist organizations.",
            ]}
          />
          <SectionParagraph
            text={
              <>
                By using the Service, you bear full responsibility for verifying the authenticity, legitimacy, identity,
                and other details about any NFT, collection, or account that you view or otherwise interact on our
                Service. We make no guarantees or promises about the identity, legitimacy, or authenticity of any NFT,
                collection, or account on the Service.
              </>
            }
            marginTop
          />
        </Section>

        {/* Termination */}
        <Section>
          <SectionHeader text="Termination" />
          <SectionParagraph
            text={
              <>
                These Terms shall remain in full force and effect while you use the Service. Without limiting any other
                provision of these Terms, we reserve the right to, in our sole discretion and without notice or
                liability, deny access to and use of the Service, at any time and for any or no reason to any person and
                you acknowledge and agree that we shall have no liability or obligation to you in such event and that
                you will not be entitled to a refund of any amounts.
              </>
            }
          />
        </Section>

        {/* Limitation of Liability */}
        <Section>
          <SectionHeader text="Limitation of Liability" />

          <SectionParagraph
            text={
              <>
                To the fullest extent permitted by law, you agree that in no event will we or our directors, employees
                or our service providers be liable to you or any third party for any lost profit or any indirect,
                consequential, exemplary, incidental, special, or punitive damages arising from these terms or the
                service, products or third-party sites and products, or for any damages related to loss of revenue, loss
                of profits, loss of business or anticipated savings, loss of use, loss of goodwill, or loss of data, and
                whether caused by strict liability or tort (including negligence), breach of contract, or otherwise,
                even if foreseeable and even if ClipIt or its service providers have been advised of the possibility of
                such damages; or (b) for any other claim, demand, or damages whatsoever resulting from or arising out of
                or in connection with these terms of the delivery, use, or performance of the service. Access to, and
                use of, the service, products or third-party sites, and products are at your own discretion and risk,
                and you will be solely responsible for any damage to your computer system or mobile device or loss of
                data or reputation resulting therefrom.
              </>
            }
          />

          <SectionParagraph
            text={
              <>
                Notwithstanding anything to the contrary contained herein, in no event shall the maximum aggregate
                liability of ClipIt arising out of or in any way related to these terms, the access to and use of the
                service, content, NFTs, or any ClipIt products or services exceed the greater of (a) $100 or (b) the
                amount received by ClipIt for its service directly relating to the items that are the subject of the
                claim. The foregoing limitations will apply even if the above stated remedy fails of its essential
                purpose.
              </>
            }
            marginTop
          />
        </Section>
      </Container>
    </CenteredContainer>
  );
}
