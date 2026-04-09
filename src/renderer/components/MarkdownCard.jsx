import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

// ── Custom code theme — matches the app's dark palette ────────

const codeTheme = {
  'code[class*="language-"]': {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: '13px',
    lineHeight: '1.65',
    color: '#e2e2f0',
    background: 'none',
  },
  'pre[class*="language-"]': {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: '13px',
    lineHeight: '1.65',
    background: '#13131a',
    color: '#e2e2f0',
    padding: '18px 20px',
    borderRadius: '10px',
    overflowX: 'auto',
    margin: '0',
    border: '1px solid #25252f',
  },
  ':not(pre) > code[class*="language-"]': {
    background: '#1e1e26',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  comment:     { color: '#6b6b80', fontStyle: 'italic' },
  prolog:      { color: '#6b6b80' },
  doctype:     { color: '#6b6b80' },
  cdata:       { color: '#6b6b80' },
  punctuation: { color: '#8888a8' },
  property:    { color: '#60a5fa' },
  tag:         { color: '#f87171' },
  boolean:     { color: '#fb923c' },
  number:      { color: '#fb923c' },
  constant:    { color: '#fb923c' },
  symbol:      { color: '#fb923c' },
  deleted:     { color: '#f87171' },
  selector:    { color: '#86efac' },
  'attr-name': { color: '#60a5fa' },
  string:      { color: '#86efac' },
  char:        { color: '#86efac' },
  builtin:     { color: '#c084fc' },
  inserted:    { color: '#86efac' },
  operator:    { color: '#f59e0b' },
  entity:      { color: '#f59e0b', cursor: 'help' },
  url:         { color: '#60a5fa' },
  variable:    { color: '#e2e2f0' },
  atrule:      { color: '#f59e0b' },
  'attr-value':{ color: '#86efac' },
  function:    { color: '#c084fc' },
  'class-name':{ color: '#60a5fa' },
  keyword:     { color: '#f59e0b', fontWeight: '500' },
  regex:       { color: '#86efac' },
  important:   { color: '#f59e0b', fontWeight: 'bold' },
  bold:        { fontWeight: 'bold' },
  italic:      { fontStyle: 'italic' },
}

// ── Markdown component overrides ──────────────────────────────

const components = {
  // Strip the default <pre> wrapper — SyntaxHighlighter provides its own.
  pre({ children }) {
    return <>{children}</>
  },

  code({ children, className, ...rest }) {
    const match = /language-(\w+)/.exec(className || '')
    if (match) {
      return (
        <SyntaxHighlighter
          language={match[1]}
          style={codeTheme}
          PreTag="div"
          wrapLongLines={false}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    }
    // Inline code
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  },
}

// ── MarkdownCard ──────────────────────────────────────────────

export default function MarkdownCard({ content }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
