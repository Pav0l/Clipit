import { Container, Typography, Box } from "@material-ui/core";
import { Logo } from "../logo/Logo";
import { SectionHeader, Section, SectionParagraph } from "../section/Section";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  logoOnClick: (to: string) => void;
}

export default function Terms(props: Props) {
  const classes = useStyles();

  return (
    <Box data-testid="terms">
      <Container>
        <Logo onClick={props.logoOnClick} textClass={classes.logo} />

        <Typography variant="h4" component="h4">
          Terms & conditions
        </Typography>

        <SectionParagraph text={<>Last updated: April 14, 2022</>} marginTop />

        {/* Introduction */}
        <Section>
          <SectionHeader text="Introduction" />
          <SectionParagraph
            text={
              <>
                Clipit is a NFT marketplace maintained by a team of developers (&quot;Clipit&quot;, &quot;we&quot;,
                &quot;us&quot; or &quot;our&quot;) build on top of{" "}
                <a href="https://zora.co/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  Zora Market and AuctionHouse
                </a>{" "}
                - an opensource NFT Marketplace Protocol on the Ethereum blockchain.
              </>
            }
          />

          <SectionParagraph
            text={
              <>
                These Terms & conditions (“Terms”) govern your access to and use of the Clipit website, our APIs and any
                other software, tools, features, or functionalities provided on or in connection with our services
                (collectively, the ”Service”).
              </>
            }
            marginTop
          />
        </Section>

        {/* Intellectual Property Rights */}
        <Section>
          <SectionHeader text="Intellectual Property Rights" />
          <SectionParagraph
            text={
              <>
                We own the intellectual property of the Service, including (but not limited to) software, text, designs,
                and copyrights.
              </>
            }
          />
          <SectionParagraph
            text={
              <>
                <Typography variant="body2" component="span" className={classes.bold}>
                  Each creator that mints NFTs using the Service keeps all intellectual property rights to such content.
                </Typography>{" "}
                We do not own any intellectual property of tokens, user-generated content or the Zora Protocol.
              </>
            }
            marginTop
          />
        </Section>

        {/* Privacy */}
        <Section>
          <SectionHeader text="Privacy" />
          <SectionParagraph
            text={
              <>
                When you use the Service, the only personal information we collect from you, if you authorize the
                Service access to obtain your data from Twitch, is your email address. We use the email address to
                contact you. We retain the data only for as long as is necessary for the purpose set out in this
                section. We may also use third-party services including (but not limited to) Twitch or Tawk, which may
                receive your publicly available personal information.
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
                even if foreseeable and even if Clipit or its service providers have been advised of the possibility of
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
                liability of Clipit arising out of or in any way related to these terms, the access to and use of the
                service, content, NFTs, or any Clipit products or services exceed the greater of (a) $100 or (b) the
                amount received by Clipit for its service directly relating to the items that are the subject of the
                claim. The foregoing limitations will apply even if the above stated remedy fails of its essential
                purpose.
              </>
            }
            marginTop
          />
        </Section>

        {/* Disclaimers */}
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
        </Section>
      </Container>
    </Box>
  );
}

const useStyles = makeAppStyles(() => ({
  logo: {
    marginBottom: "2rem",
  },
  bold: {
    fontWeight: 500,
    textDecoration: "underline",
  },
}));
