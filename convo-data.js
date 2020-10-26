window.convo = {
  goTo: (id) => {
    console.log(id);
  },

  data: {
    'greet-visitor': {
      content: 'Hello [hashid]. My name is online-tracking-transparency-agent.js, but you can call me otta.js, I am a classical artificial intelligence programmed to help you see how I see you.',
      options: {
        'I see': () => { console.log(this); }
      }
    }
  }
}
