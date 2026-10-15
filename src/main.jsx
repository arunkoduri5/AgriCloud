import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null}}
  static getDerivedStateFromError(error){return {error}}
  componentDidCatch(error,info){console.error('AgriRent render error:',error,info)}
  render(){
    if(this.state.error) return <main style={{fontFamily:'Arial,sans-serif',maxWidth:620,margin:'12vh auto',padding:28,color:'#263b2b',background:'#f5f8f1',borderRadius:12}}>
      <h1 style={{fontSize:26}}>AgriRent could not load</h1>
      <p style={{lineHeight:1.6,color:'#677367'}}>The app hit an error while drawing the page. Clear its saved demo data and reload. If the problem continues, send this error to support:</p>
      <pre style={{whiteSpace:'pre-wrap',fontSize:12,padding:14,background:'#fff',borderRadius:8,border:'1px solid #dfe6dd'}}>{String(this.state.error?.message||this.state.error)}</pre>
      <button onClick={()=>{localStorage.removeItem('agrirent-demo-v1');localStorage.removeItem('agrirent-user');window.location.reload()}} style={{padding:'11px 16px',background:'#386b43',color:'#fff',border:0,borderRadius:7,fontWeight:700,cursor:'pointer'}}>Clear saved data and reload</button>
    </main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>);
