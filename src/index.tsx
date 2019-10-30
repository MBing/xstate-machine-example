import React, { useState } from 'react';
import { render } from 'react-dom';
import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import bootstrap from 'bootstrap'; // eslint-disable-line no-unused-vars
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const fakePayment = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('Hello Success'), 1000);
  });
};

const stateMachine = Machine({
  initial: 'idle',
  context: {
    msg: '',
  },
  states: {
    idle: {
      on: {
        SUBMIT: [
          {
            target: 'loading',
            cond: (ctx, event) =>
              event.data.name !== '' && event.data.card !== '',
          },
          {
            target: 'error',
          },
        ],
      },
    },
    loading: {
      invoke: {
        id: 'doPayment',
        src: () => fakePayment(),
        onDone: {
          target: 'success',
          actions: assign({ msg: (ctx, event) => event.data }),
        },
        onError: {
          target: 'error',
          actions: assign({ msg: (ctx, event) => event.data }),
        },
      },
    },
    error: {
      on: {
        SUBMIT: {
          target: 'loading',
          cond: (ctx, event) =>
            event.data.name !== '' && event.data.card !== '',
        },
      },
    },
    success: {
      type: 'final',
    },
  },
});

function App() {
  const [machine, send] = useMachine(stateMachine);
  const [name, setName] = useState('');
  const [card, setCard] = useState('');

  console.log(machine.value);

  const handleSubmit = e => {
    e.preventDefault();
    send({
      type: 'SUBMIT',
      data: {
        name,
        card,
      },
    });
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>State Machine Example</h1>
      </div>

      {machine.matches('error') ? (
        <div className="alert error">
          {machine.context.msg
            ? machine.context.msg
            : 'Oh no! No error message.'}
        </div>
      ) : null}

      <div className="form-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="NameOnCard">Name on card</label>
            <input
              type="text"
              id="NameOnCard"
              className="form-control"
              onChange={e => setName(e.target.value)}
              value={name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="CardNumber">Card number</label>
            <input
              type="text"
              id="CardNumber"
              className="form-control"
              onChange={e => setCard(e.target.value)}
              value={card}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
render(<App />, rootElement);
