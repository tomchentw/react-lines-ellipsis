require('core-js/fn/string/repeat') // IE 11
require('raf/polyfill') // IE 9

const preact = require('preact')
const debounce = require('lodash/debounce')
const responsiveHOC = require('../src/responsiveHOC')
const LinesEllipsis = responsiveHOC()(require('../src/index'))
const HTMLEllipsis = responsiveHOC()(require('../src/html'))
const lorem = require('./lorem')
const log = console.log.bind(console)

const {h, render, Component} = preact
const lang = window.location.search.slice(1)
const defaultText = lorem[lang] || lorem.en
const unsafe = lang === 'html'

if (unsafe) {
  document.querySelector('.unsafe-warning').removeAttribute('hidden')
}

/** @jsx h */
class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      text: defaultText,
      maxLine: 3,
      useEllipsis: true
    }
    this.onTextClick = this.onTextClick.bind(this)
    this.onTextKey = this.onTextKey.bind(this)
    this.onTextEdit = debounce(this.onTextEdit.bind(this), 100)
    this.onChangeLines = debounce(this.onChangeLines.bind(this))
  }

  componentDidMount () {
    log(`isClamped: ${this.linesEllipsis.isClamped()} when page didMount`)
  }

  onTextClick (e) {
    e.preventDefault()
    this.setState({useEllipsis: false})
  }

  onTextKey (e) {
    if (e.keyCode === 13) {
      this.onTextClick(e)
    }
  }

  onTextEdit (e) {
    this.setState({
      text: e.target.value,
      useEllipsis: true
    })
  }

  onChangeLines (e) {
    this.setState({
      maxLine: e.target.value,
      useEllipsis: true
    })
  }

  renderUnsafe () {
    const {text, maxLine, useEllipsis} = this.state
    return (
      <div>
        <label className='lines-controller hide-sm'>
          Show {maxLine} lines:
          <input type='range' value={maxLine} min='1' max='10' onInput={this.onChangeLines} />
        </label>
        {useEllipsis
          ? (
            <div onClick={this.onTextClick} onKeyDown={this.onTextKey} tabIndex='0'>
              <HTMLEllipsis
                innerRef={node => { this.linesEllipsis = node }}
                component='article'
                className='ellipsis-html'
                unsafeHTML={text}
                maxLine={maxLine}
                ellipsisHTML='<i>... read more</i>'
                onReflow={log}
              />
            </div>
          )
          : <article className='ellipsis-html' dangerouslySetInnerHTML={{__html: text}} />
        }
        <textarea
          className='text-editor'
          value={text}
          onInput={this.onTextEdit}
          placeHolder='Enter any HTML'
          spellCheck='false'
        />
      </div>
    )
  }

  renderSafe () {
    const {text, maxLine, useEllipsis} = this.state
    return (
      <div>
        <label className='lines-controller hide-sm'>
          Show {maxLine} lines:
          <input type='range' value={maxLine} min='1' max='10' onInput={this.onChangeLines} />
        </label>
        {useEllipsis
          ? (
            <div onClick={this.onTextClick} onKeyDown={this.onTextKey} tabIndex='0'>
              <LinesEllipsis
                innerRef={node => { this.linesEllipsis = node }}
                component='article'
                className='ellipsis-text'
                text={text}
                maxLine={maxLine}
                ellipsis='... read more'
                onReflow={log}
              />
            </div>
          )
          : <article className='ellipsis-text'>{text}</article>
        }
        <textarea
          className='text-editor'
          value={text}
          onInput={this.onTextEdit}
          placeHolder='Enter any text'
          spellCheck='false'
        />
      </div>
    )
  }

  render () {
    return unsafe ? this.renderUnsafe() : this.renderSafe()
  }
}

window.requestAnimationFrame(function bootstrap () {
  render(<App />, document.getElementById('react-root'))
})
