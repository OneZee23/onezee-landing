import React from 'react';

const Greetings: React.FC = () => {
  return (
    <section>
      <p>
        Hello! My name is Nikita. I am a developer with a
        many experience in integration blockchain technology to applications.
      </p>
      <p>
        ...
      </p>
    </section>
  );
}

const App: React.FC = () => {
  return (
    <div>
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
        <Greetings></Greetings>
      </main>
      <footer>
        <p>For more information {'-->'} type me a message!</p>
      </footer>
    </div>
  );
};

export default App;
