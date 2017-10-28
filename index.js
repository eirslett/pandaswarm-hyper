const getStdin = require('get-stdin');

function callback (err, res) {
  console.log('CALLBACK');
  console.log('err', err);
  console.log('res', res);
}

async function run () {
  const input = await getStdin();
  try {
    const event = JSON.parse(Buffer.from(input, 'base64').toString('utf-8'));
    console.log('data', event);
    if (!event.script) {
      console.error('No "script" property provided.');
    }
    try {
      const scriptText = event.script;

      try {
        const cleanEnv = JSON.parse(JSON.stringify(event.env || '{}'))
        Object.assign(process.env, cleanEnv)
      } catch (error) {
        console.error('Could not add environment variables', event.env)
      }

      const script = new vm.Script(scriptText)
      script.runInContext(new vm.createContext({
        'self': global,
        'global': global,
        'require': require,
        'Buffer': Buffer,
        'console': console,
        'setTimeout': setTimeout,
        'callback': callback,
        'process': process,
        'regeneratorRuntime': regeneratorRuntime
      }))
    } catch (err) {
      console.log('Could not run script', err);
    }

  } catch (err) {
    console.error('Could not parse input as JSON', err);
  }
}

run();
