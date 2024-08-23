import React from 'react';

const Greetings: React.FC = () => {
  return (
    <section>
      <p>
        Hello! My name is Nikita. I am a developer with extensive experience in integrating blockchain technology into
        applications.
      </p>
      <p>
        I have extensive experience in developing backend systems for a Telegram-based messenger app and integrating
        Blockchains and DeFi platforms for <a href="https://www.imem.app/">iMeMessenger</a>.
        Notably, I have integrated <b>Bitcoin</b>, <b>EVM (Ethereum, Binance Smart Chain, Polygon, and many other
        EVM-based and L2 networks)</b>, <b>Tron</b>, <b>TON (The Open Network)</b>, and <b>Solana</b>.
        DeFi protocols: <b>Uniswap</b>, <b>PancakeSwap</b>, <b>Symbiosis</b>, <b>1Inch</b>, <b>SunSwap</b>, and other
        DEXs.
        I have also conducted security audits for projects, including arbitrage algorithms and staking platforms.
      </p>
      <p>
        I have recently started compiling contracts with Rust for the Solana blockchain.
      </p>
      <p>
        Alongside my role at iMeMessenger, I continue to develop as a NodeJS Backend Blockchain developer, focusing on
        blockchain products and Telegram APIs.
      </p>
    </section>
  );
}

const SkillsSummary: React.FC = () => {
  return (
    <section>
      <a className="header-link" href="#skills"
      ><h2 id="skills_summary">Skills Summary</h2></a
      >
      <ul>
        <li>
          Programming Languages:<br/>
          Skilled JS, TypeScript, Solidity<br/>
          Familiarity with C++, Python and little MatLab, VBA.
        </li>
        <li>Frameworks: NestJS ... a little bit of Django.</li>
        <li>Tech skills: Linux, SQL, Git, Docker, Grafana, K8s, RabbitMQ, Radis.</li>
        <li>Languages: English (B1 by Cambridge PET Exam), Russian (Native)</li>
        <li>
          Interests: Blockchain, Distributed Systems, Microservice Orchestration,
          Robust, beautiful and maintainable backend.
        </li>
      </ul>
    </section>
  );
}

const RecentActivity: React.FC = () => {
  return (
    <section>
      <a className="header-link" href="#recent_activity"
      ><h2 id="recent_activity">Public Activity</h2></a
      >
      <ul>
        <li>
          Achieved 1th place in <a href="https://cybergarden.ru/">CyberGarden</a> hackathon in team challenge. A web
          application
          has been created to track devices in multi-story offices.
        </li>
        <li>
          Developed a crash course in web-technology topic at <a href="https://www.kubsu.ru/index.php">Kuban State
          University</a> for bachelors students used Notion,
          NestJS and HTML + Css static.
        </li>
        <li>
          Made telegram-bot in an 1 hour - <a href="https://t.me/chepoauto_bot">@chepoauto</a> for blogger - <a
          href="https://t.me/chepotachkam">@chepotachkam</a> used NestJS server and own skills.
        </li>
      </ul>
    </section>
  );
}

const WorkExperience: React.FC = () => {
  return (
    <section>
      <a className="header-link" href="#work_experience"
      ><h2 id="work_experience">Work Experience</h2></a
      >
      <ul>
        <li>
          <h3>
            Feb 2021 -{"> "}
            <span className="highlight">Present</span> |
            Backend Developer @
            <a href="https://imem.app">iMe Messenger</a>
          </h3>
          <ul>
            <li>
              In the company since the integration of the crypto wallet.
            </li>
            <li>
              Integrated EVM, Tron, TON, Bitcoin, Solana and other L2 networks.
            </li>
            <li>
              Integrated DEX and Defi blockchain-based projects such as Uniswap, 1inch, Symbiosis, Changelly and others.
            </li>
            <li>
              Integrated Binance API functionality into the application for an exclusive partner project.
            </li>
            <li>Identifying and fixing bugs.</li>
            <li>
              Generated and implemented ideas for indexing, tracking blockchain transactions for the crypto wallet.
            </li>
            <li>
              Grew in the company from an intern to a senior blockchain backend developer.
            </li>
          </ul>
        </li>
        <li>
          <h3>
            Jun 2020 -{">"} Jul 2020 | Practice as Django Backend developer
            <a href="https://prodoctorov.ru/"> @ProDoctorov Krasnodar</a>
          </h3>
          <ul>
            <li>Working on practice for university course project</li>
          </ul>
        </li>
      </ul>
    </section>
  );
}

const App: React.FC = () => {
  return (
    <div className="page-content">
      <div className="container">
        <header>
          <h1>Nikita Shevelev | Backend Blockchain Developer</h1>
          <p>
            <a href="https://t.me/onezee23">Telegram</a> |
            <a href="mailto:onezeecsgo@icloud.com"> Email</a>
          </p>
          <p>
            <a href="https://github.com/onezee23">GitHub</a> |
            <a href="https://gitlab.com/OneZee"> GitLab</a>
          </p>
          <p>
            <a href="https://t.me/onezee23">CV</a> |
            <a href="https://www.youtube.com/c/onezee"> YouTube</a>
          </p>
        </header>
        <main>
          <Greetings/>
          <SkillsSummary/>
          <RecentActivity/>
          <WorkExperience/>
        </main>
        <footer>
          <p>For more information {'-->'} type me a message!</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
