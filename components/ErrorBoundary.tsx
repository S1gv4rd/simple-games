"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-pink/10 to-purple/10">
          <div className="text-8xl mb-6">😅</div>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-purple">
            Oops! Something went wrong
          </h1>
          <p className="text-xl text-center mb-8 text-foreground/70">
            Let&apos;s go back and try again!
          </p>
          <button
            onClick={this.handleReset}
            className="game-button bg-purple text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
          >
            Go Home
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
