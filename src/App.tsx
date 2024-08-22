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
      ><h2 id="skills_summary">Skills summary</h2></a
      >
      <ul>
        <li>
          Programming Languages:<br/>
          Skilled JS, TypeScript, Solidity<br/>
          Familiarity with C++, Python and little MatLab, VBA.
        </li>
        <li>Tech skills: Linux, SQL, Git, Docker, Grafana, K8s</li>
        <li>Languages: English (B1 by Cambridge PET Exam), Russian (Native)</li>
        <li>
          Interests: Blockchain, Distributed Systems, Microservice Orchestration,
          Robust, beautiful and maintainable backend.
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
        </main>
        <footer>
          <p>For more information {'-->'} type me a message!</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
