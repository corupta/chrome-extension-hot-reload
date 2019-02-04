const connect = () => {
  const name = `popup_${Math.floor(Math.random() * 10000)}`;
  const port = chrome.runtime.connect({ name });
  port.onMessage.addListener((msg) => {
    if (msg === 'hot_reload_signal') {
      window.location.reload(false);
    }
  });
};

export default connect;
