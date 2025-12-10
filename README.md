# JavaScript Visualizer

Advanced educational tool for visualizing JavaScript code execution step-by-step. Understand how JavaScript works internally by seeing the call stack, scope chains, object references, and the Event Loop in action.

## Features

### Execution Mode
- **Step-by-Step Debugging** - Execute JavaScript code line-by-line with visual feedback
- **Scope Visualization** - See global, closure, and local scopes at each execution step
- **Object References** - Track objects, arrays, and functions with unique IDs
- **Call Stack Tracking** - Visualize function calls and returns
- **Interactive Navigation** - Step slider to move through execution timeline
- **Code Editor** - Built-in CodeMirror editor with syntax highlighting
- **Event Loop Tracking** - Monitor async operations (Promises, setTimeout, microtasks)

### AI Visualization Mode
- **AI-Powered Explanations** - Chat interface using Claude 3.5 Haiku
- **Algorithm Explanations** - Get detailed explanations of how algorithms work
- **ASCII Diagrams** - Generate visual diagrams for data structures
- **Real-time Streaming** - Live AI responses as they're generated
- **Code Analysis** - Ask questions about code behavior and flow

### Advanced Features
- **V8 Inspector Integration** - Uses Node.js debugging protocol for accurate execution
- **Hybrid Execution** - Tracks async operations without executing callbacks
- **Circular Reference Handling** - Safely serializes complex object graphs
- **Closure Capture** - Records variables available to async callbacks
- **Memory Visualization** - See how objects are stored and referenced

## Tech Stack

### Frontend (Client)
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - Latest React features
- **TypeScript 5** - Type-safe development
- **CodeMirror 6** - Professional code editor
- **TailwindCSS 4** - Modern styling with custom animations
- **Radix UI** - Accessible UI primitives
- **Vercel AI SDK** - AI integration with streaming support
- **Anthropic Claude 3.5 Haiku** - AI model for explanations
- **Lucide React** - Icon library

### Backend (Server)
- **NestJS 11** - Progressive Node.js framework
- **TypeScript 5.7.3** - Type safety
- **V8 Inspector Protocol** - Chrome DevTools debugging API
- **Node.js VM Module** - Isolated code execution
- **async_hooks API** - Async operation tracking
- **class-validator** - Request validation


### Prerequisites

- Node.js 18+ and npm/yarn
- API key for Anthropic Claude (for AI mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd javascript-visualizer
   ```

2. **Install dependencies**

   Server:
   ```bash
   cd server
   npm install
   ```

   Client:
   ```bash
   cd client
   npm install
   ```

3. **Configure environment variables**

   Create `.env.local` in the `client` directory:
   ```env
   # Anthropic API key for AI mode
   ANTHROPIC_API_KEY=your-api-key-here

   # Backend API URL (default: http://localhost:3000)
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start development servers**

   Terminal 1 - Backend:
   ```bash
   cd server
   npm run start:dev
   ```

   Terminal 2 - Frontend:
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## How It Works

### Execution Mode Flow

1. **User Input** - Write JavaScript code in the CodeMirror editor
2. **Code Submission** - Click "Visualize" to send code to backend
3. **Backend Processing**:
   - Code is executed in isolated VM context
   - V8 Inspector sets breakpoints on every line
   - At each breakpoint, captures:
     - Current call frame
     - Scope chain (global, closure, local)
     - Object references
     - Async operations initiated
4. **Execution Trace** - Returns array of execution steps
5. **Frontend Visualization**:
   - Parses execution steps into frames
   - Displays current line highlighting
   - Shows variable values in scope panels
   - Renders object references with unique IDs
   - Provides step slider for navigation

### V8 Inspector Integration

The visualizer uses Node.js V8 Inspector Protocol to:
- Set breakpoints programmatically
- Pause execution at each line
- Evaluate expressions in current scope
- Serialize variables (with circular reference handling)
- Track function calls and returns

### Event Loop Tracking

Uses Node.js `async_hooks` API to monitor:

**Promises**
- Creation and resolution
- State tracking (pending, fulfilled, rejected)
- Closure variable capture

**Timers**
- setTimeout/setInterval registration
- Delay and callback tracking
- Closure capture at creation time

**Microtasks**
- queueMicrotask operations
- process.nextTick calls
- Execution order tracking

## API Endpoints

### Execute Code

```http
POST /coordinator/execute
Content-Type: application/json

{
  "code": "const x = 5;\nconst y = x * 2;\nconsole.log(y);"
}
```

**Response:**
```json
{
  "success": true,
  "trace": [
    {
      "line": 1,
      "scopes": {
        "global": {},
        "closure": {},
        "local": { "x": 5 }
      },
      "objects": {},
      "callStack": ["<global>"]
    },
    ...
  ],
  "originalCode": "const x = 5;\nconst y = x * 2;\nconsole.log(y);",
  "totalSteps": 3
}
```

## JavaScript Concepts Visualized

### 1. Execution Context
- **Call Stack** - Function call hierarchy
- **Scope Chain** - Variable resolution order (local → closure → global)
- **Hoisting** - Variable and function declarations

### 2. Memory and References
- **Primitive Values** - Numbers, strings, booleans displayed inline
- **Object References** - Separate panel with unique IDs
- **Arrays** - Element-by-element visualization
- **Functions** - Function objects with closure capture

### 3. Closures
- **Captured Variables** - See which variables are closed over
- **Lexical Scoping** - Visual representation of scope chains
- **Multiple Closures** - Track multiple closure contexts

### 4. Event Loop (Partial)
- **Async Operations** - Track creation of promises and timers
- **Closure Capture** - Variables available to async callbacks
- **Microtask vs Macrotask** - Different queue types

### 5. Control Flow
- **Line-by-Line Execution** - Highlighted current line
- **Function Calls** - Entry and exit points
- **Conditional Logic** - Branch execution paths

### Step Collection Algorithm

1. **Breakpoint Setup** - Set breakpoint on every line using V8 Inspector
2. **Pause and Capture** - At each breakpoint:
   - Extract all scopes using Inspector Protocol
   - Serialize variables with circular reference handling
   - Detect async operation creation
3. **Async Detection** - When Promise/setTimeout detected:
   - Capture closure variables at creation time
   - Record in event loop tracker
   - Skip callback execution (hybrid mode)
4. **Trace Building** - Construct execution trace with:
   - Line number
   - Scope data (global, closure, local)
   - Object references
   - Call stack
   - Event loop state

### Variable Serialization

Handles complex scenarios:
- **Circular References** - Tracked and prevented
- **Depth Limiting** - Prevents stack overflow
- **Type Preservation** - Numbers, strings, booleans, objects, arrays, functions
- **Property Filtering** - Excludes internal Node.js properties
- **Function Serialization** - Captures function source and name

### Safety Features

- **Execution Timeout** - 150 seconds maximum
- **Step Limit** - Maximum 1001 steps to prevent infinite loops
- **Isolated VM** - Code runs in separate VM context
- **Error Handling** - Graceful error messages and recovery

## Known Limitations

### Current Implementation
- **Hybrid Mode** - Async callbacks are tracked but not executed
- **Console Output** - Not yet captured in execution mode
- **Event Loop UI** - Infrastructure complete, UI visualization in progress
- **Debugging Async Code** - Callback execution not fully visualized
- **Performance** - Large objects may slow down visualization

### Future Improvements
- Full async callback execution with visualization
- Console.log output capture and display
- Performance optimization for large traces
- More comprehensive event loop visualization
- Web API tracking (DOM, fetch, etc.)

## Configuration

### Execution Limits
- Maximum steps: 1001
- Execution timeout: 150 seconds
- Object depth limit: Configurable in serializer

### Editor Settings
- Syntax highlighting: Enabled
- Line numbers: Enabled
- Auto-completion: Available
- Theme: Customizable

## Use Cases

### Educational
- **Teaching JavaScript** - Visual aid for explaining concepts
- **Learning Closures** - See closure variables in action
- **Understanding Async** - Visualize event loop behavior
- **Debugging Skills** - Practice step-by-step debugging

### Development
- **Code Understanding** - Analyze unfamiliar code
- **Bug Investigation** - Step through problematic code
- **Algorithm Visualization** - See how algorithms execute
- **Interview Preparation** - Practice explaining code execution

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Roadmap

- [ ] Complete Event Loop UI visualization
- [ ] Console.log output capture
- [ ] Full async callback execution
- [ ] Web API tracking (setTimeout, fetch, DOM)
- [ ] Performance optimization for large traces
- [ ] Export execution traces
- [ ] Shareable visualization links
- [ ] Mobile-responsive design
- [ ] Dark/light theme toggle
- [ ] Syntax error highlighting
- [ ] Code snippets library
- [ ] Execution replay controls
- [ ] Memory usage visualization

## License

This project is licensed under the MIT License.

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Backend framework
- [CodeMirror](https://codemirror.net/) - Code editor
- [V8 Inspector Protocol](https://nodejs.org/api/inspector.html) - Debugging API
- [Anthropic Claude](https://www.anthropic.com/) - AI explanations
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI integration
- [Radix UI](https://www.radix-ui.com/) - UI primitives

## Support

For issues and questions, please open an issue in the repository.

---

**Note**: This is an educational tool designed to help understand JavaScript execution. It is not intended for production code debugging or security-sensitive applications.
