export const dynamic = "force-dynamic";
// app/api/admin/seed/route.ts
// Seeds BNC 2026 profiles into the live database.
// Protected by ADMIN_SECRET env var.
// Hit: GET /api/admin/seed?secret=YOUR_SECRET

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const EVENT_CODE = process.env.SEED_EVENT_CODE || "BNC2026";

const PROFILES = [
  {
    pubkey: "bnc_bitange_ndemo",
    name: "Bitange Ndemo",
    role: "Researcher",
    location: "Nairobi, Kenya",
    core_vibe: "Deep Research",
    building: "Academic research and policy frameworks for digital finance in Kenya. Professor of Entrepreneurship at University of Nairobi.",
    needs: "Founders and builders who want to engage with policy. Looking for people bridging grassroots Bitcoin adoption and regulatory dialogue.",
    vibe: "I've been in tech policy longer than most people have known about Bitcoin. I want conversations that go beyond the surface.",
    interests: ["#bitcoin", "#africa", "#impact", "#community", "#fintech"],
  },
  {
    pubkey: "bnc_noelyne_sumba",
    name: "Noelyne Sumba",
    role: "Founder",
    location: "Nairobi, Kenya",
    core_vibe: "Ship Mode",
    building: "Ark Node AI — AI tools for Bitcoin node operators and builders in emerging markets.",
    needs: "ML engineers and data scientists interested in Bitcoin infrastructure. Also looking for early adopters to test.",
    vibe: "I build at the intersection of AI and Bitcoin. Curious, fast-moving, love collaborating with people who ship.",
    interests: ["#ai", "#bitcoin", "#open-source", "#africa", "#lightning"],
  },
  {
    pubkey: "bnc_everlyn_macharia",
    name: "Everlyn Macharia",
    role: "Community",
    location: "Nairobi, Kenya",
    core_vibe: "High Leverage",
    building: "Bitcoin Babies — empowering mothers and families in Nairobi's informal settlements through Bitcoin circular economy participation.",
    needs: "Partners who want to run Bitcoin education for non-technical communities. Sponsors for the next cohort.",
    vibe: "Bitcoin adoption starts with people, not code. I want to meet builders who understand that the last mile matters most.",
    interests: ["#bitcoin", "#africa", "#community", "#impact", "#payments"],
  },
  {
    pubkey: "bnc_erik_hersman",
    name: "Erik Hersman",
    role: "Builder",
    location: "Nairobi, Kenya",
    core_vibe: "High Leverage",
    building: "Gridless — off-grid Bitcoin mining powered by stranded renewable energy across rural Africa.",
    needs: "Energy engineers, policy contacts in East African energy sectors, and investors in sustainable infrastructure.",
    vibe: "I've been building African tech infrastructure for 20 years. Looking for people solving hard physical problems, not just software.",
    interests: ["#bitcoin", "#africa", "#impact", "#open-source", "#startups"],
  },
  {
    pubkey: "bnc_rosaline_wangui",
    name: "Rosaline Wangui",
    role: "Founder",
    location: "Nairobi, Kenya",
    core_vibe: "Ship Mode",
    building: "Bitbiashara — enabling Kenyan small businesses to accept Bitcoin and Lightning payments with simple, mobile-first tooling.",
    needs: "Merchant acquirers and payment integrators. Also want to meet other founders solving merchant onboarding in Africa.",
    vibe: "Biashara means business. I'm here to build the tools that make Bitcoin practical for the person selling mandazi on the corner.",
    interests: ["#bitcoin", "#lightning", "#fintech", "#africa", "#payments"],
  },
  {
    pubkey: "bnc_josef_tetek",
    name: "Josef Tetek",
    role: "Researcher",
    location: "Prague, Czech Republic",
    core_vibe: "Deep Research",
    building: "Trezor Academy — Bitcoin education for hardware wallet users, focused on self-custody and security best practices.",
    needs: "Bitcoin educators and curriculum designers. Looking for people building education programs in Africa.",
    vibe: "I believe education is the most leveraged thing you can do for Bitcoin adoption. Let's talk if you teach.",
    interests: ["#bitcoin", "#privacy", "#open-source", "#community"],
  },
  {
    pubkey: "bnc_jusper_machogu",
    name: "Jusper Machogu",
    role: "Researcher",
    location: "Nairobi, Kenya",
    core_vibe: "Deep Research",
    building: "Fossil Fuels for Africa — making the case for energy access in Africa and the role Bitcoin mining can play in funding it.",
    needs: "Energy economists, policy researchers, and journalists covering African development.",
    vibe: "Unpopular takes welcome. I want conversations that challenge Western narratives about Africa and energy.",
    interests: ["#bitcoin", "#africa", "#impact", "#community"],
  },
  {
    pubkey: "bnc_fidel_otieno",
    name: "Fidel Otieno",
    role: "Founder",
    location: "Nairobi, Kenya",
    core_vibe: "Ship Mode",
    building: "Bitika — peer-to-peer Bitcoin exchange built for East Africa. Simple, fast, mobile-first.",
    needs: "Compliance and legal expertise in East African fintech regulation. Also want liquidity partners.",
    vibe: "P2P is the future of exchange in Africa. Looking for people who understand local markets, not just global crypto trends.",
    interests: ["#bitcoin", "#fintech", "#africa", "#payments", "#startups"],
  },
  {
    pubkey: "bnc_sabina_gitau",
    name: "Sabina Gitau",
    role: "Founder",
    location: "Nairobi, Kenya",
    core_vibe: "High Leverage",
    building: "Tando — Bitcoin savings and payments product built specifically for the East African market.",
    needs: "Product designers and growth marketers who understand the Kenyan consumer. Also looking for banking partnerships.",
    vibe: "Building for the woman in the chama, not the trader on the exchange. Community and trust are everything.",
    interests: ["#bitcoin", "#lightning", "#fintech", "#africa", "#community"],
  },
  {
    pubkey: "bnc_christophe_hamisi",
    name: "Christophe Hamisi",
    role: "Community",
    location: "Nairobi, Kenya",
    core_vibe: "High Leverage",
    building: "BridgeSat Academy — Bitcoin education programs connecting diaspora Bitcoin knowledge with on-the-ground communities in East Africa.",
    needs: "Curriculum developers and educators. Want to meet diaspora Bitcoiners who want to give back to home communities.",
    vibe: "The bridge between worlds. I work best with people who are as comfortable in Kibera as they are in a boardroom.",
    interests: ["#bitcoin", "#africa", "#community", "#impact", "#lightning"],
  },
  {
    pubkey: "bnc_sharon_murugi",
    name: "Sharon Murugi",
    role: "Community",
    location: "Nairobi, Kenya",
    core_vibe: "High Leverage",
    building: "Btrust — Bitcoin developer grants and education programs across Africa.",
    needs: "Journalists, content creators, and communications professionals interested in Bitcoin. Also developers applying for grants.",
    vibe: "Stories change minds. I want to meet people who can help the world understand what's actually happening with Bitcoin in Africa.",
    interests: ["#bitcoin", "#africa", "#community", "#content", "#impact"],
  },
  {
    pubkey: "bnc_linda_kariuki",
    name: "Linda Kariuki",
    role: "Community",
    location: "Nairobi, Kenya",
    core_vibe: "Ship Mode",
    building: "Bitsavers Eduhub — Bitcoin financial literacy programs for students and young professionals in Kenya.",
    needs: "School and university partnerships. Looking for curriculum sponsors and guest lecturers.",
    vibe: "The next generation of Bitcoiners is in school right now. I want to meet people who want to reach them.",
    interests: ["#bitcoin", "#africa", "#community", "#impact", "#content"],
  },
  {
    pubkey: "bnc_edith_mpumwire",
    name: "Edith Mpumwire",
    role: "Community",
    location: "Kampala, Uganda",
    core_vibe: "High Leverage",
    building: "Nile Bitcoin Community — growing Bitcoin adoption across Uganda through meetups, education, and merchant onboarding.",
    needs: "Bitcoin businesses interested in Uganda expansion. Also want to meet other East African community builders.",
    vibe: "Uganda is ready. I'm building the infrastructure for adoption here — let's connect if you want to be part of it.",
    interests: ["#bitcoin", "#africa", "#community", "#impact", "#payments"],
  },
  {
    pubkey: "bnc_brindon_mwiine",
    name: "Brindon Mwiine",
    role: "Builder",
    location: "Kampala, Uganda",
    core_vibe: "Ship Mode",
    building: "Gorilla Sats — Bitcoin circular economy and merchant adoption network in Uganda.",
    needs: "Growth hackers and community managers for East African markets. Looking for merchant POS solutions.",
    vibe: "Marketing Bitcoin in Africa is different from anywhere else. Real stories, real people, real use cases.",
    interests: ["#bitcoin", "#lightning", "#africa", "#community", "#payments"],
  },
  {
    pubkey: "bnc_wycliffe_osano",
    name: "Wycliffe Osano",
    role: "Founder",
    location: "Nairobi, Kenya",
    core_vibe: "Ship Mode",
    building: "Kaze — Bitcoin remittance and cross-border payment product for the East African corridor.",
    needs: "Compliance and regulatory advisors in Kenya, Uganda, Tanzania. Also want to meet other remittance founders.",
    vibe: "Remittances are the killer app for Bitcoin in Africa. I'm building the infrastructure — let's talk if you want to use it.",
    interests: ["#bitcoin", "#lightning", "#payments", "#fintech", "#africa"],
  },
  {
    pubkey: "bnc_angella_wafwoyo",
    name: "Angella Wafwoyo",
    role: "Community",
    location: "Kampala, Uganda",
    core_vibe: "High Leverage",
    building: "School of Satoshi — Bitcoin education programs in Uganda, focused on women and underserved communities.",
    needs: "Sponsors for education materials and instructors. Want to meet other Bitcoin educators across East Africa.",
    vibe: "Knowledge is the first step. I'm committed to making Bitcoin understandable for every Ugandan who wants to learn.",
    interests: ["#bitcoin", "#africa", "#community", "#impact", "#content"],
  },
  {
    pubkey: "bnc_hanan_ibrahim",
    name: "Hanan Ibrahim MBE",
    role: "Community",
    location: "London, UK",
    core_vibe: "High Leverage",
    building: "Bitcoin SheLeads — global network empowering women in Bitcoin.",
    needs: "Female Bitcoin founders and builders across Africa. Also want institutional partners for women-in-Bitcoin programs.",
    vibe: "Women are the fastest growing segment of Bitcoin adoption globally. I want to meet builders who are thinking about inclusion from day one.",
    interests: ["#bitcoin", "#community", "#impact", "#africa", "#investing"],
  },
  {
    pubkey: "bnc_isack_njama",
    name: "Isaack Njama",
    role: "Builder",
    location: "Nairobi, Kenya",
    core_vibe: "Deep Research",
    building: "Minmo — Bitcoin infrastructure tooling. Engineer focused on node operation and Lightning reliability.",
    needs: "Other Lightning engineers and node operators. Also want to meet people building on top of Minmo's stack.",
    vibe: "Deep in the stack. I like conversations about protocol-level tradeoffs, not product roadmaps.",
    interests: ["#bitcoin", "#lightning", "#open-source", "#privacy"],
  },
  {
    pubkey: "bnc_laban_mwansa",
    name: "Dr. Laban Mwansa",
    role: "Operator",
    location: "Prague, Czech Republic",
    core_vibe: "High Leverage",
    building: "Braiins — Bitcoin mining software and pool operations. Business development focused on African market entry.",
    needs: "Mining operators and energy entrepreneurs in East Africa. Want to discuss partnership models for African miners.",
    vibe: "Mining is infrastructure. I want to meet people who see it that way and are building it seriously.",
    interests: ["#bitcoin", "#africa", "#startups", "#open-source"],
  },
  {
    pubkey: "bnc_jason_tando",
    name: "Jason",
    role: "Builder",
    location: "Nairobi, Kenya",
    core_vibe: "Ship Mode",
    building: "Tando — Bitcoin payments and savings for East Africa. Also BNC Tech lead.",
    needs: "Backend engineers experienced with Lightning and Bitcoin RPCs. Also looking for QA testers in the Kenyan market.",
    vibe: "Tech lead by day, conference organizer by night. I want to meet other builders who are doing multiple things at once.",
    interests: ["#bitcoin", "#lightning", "#open-source", "#fintech", "#africa"],
  },
];

export async function GET(request: NextRequest) {
  // Check secret
  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET env var not set" }, { status: 500 });
  }
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const results: string[] = [];

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (pubkey, npub, created_at, last_seen)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET last_seen = excluded.last_seen
    `);

    const insertProfile = db.prepare(`
      INSERT INTO profiles (pubkey, name, role, location, core_vibe, building, needs, vibe, invite_code, interests, personality, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET
        name        = excluded.name,
        role        = excluded.role,
        location    = excluded.location,
        core_vibe   = excluded.core_vibe,
        building    = excluded.building,
        needs       = excluded.needs,
        vibe        = excluded.vibe,
        invite_code = excluded.invite_code,
        interests   = excluded.interests,
        updated_at  = excluded.updated_at
    `);

    const seedAll = db.transaction(() => {
      for (const p of PROFILES) {
        insertUser.run(p.pubkey, `npub_${p.pubkey}`, now, now);
        insertProfile.run(
          p.pubkey, p.name, p.role, p.location, p.core_vibe,
          p.building, p.needs, p.vibe, EVENT_CODE,
          JSON.stringify(p.interests),
          JSON.stringify({ energy: 50, purpose: 50, thinking: 50, working: 50, journey: 50 }),
          now,
        );
        results.push(`${p.name} — ${p.role}`);
      }
    });

    seedAll();

    return NextResponse.json({
      success: true,
      event_code: EVENT_CODE,
      seeded: results.length,
      profiles: results,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
