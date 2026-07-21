/* ============================================================
   ChessQuest — stockfish-uci.js (backend)
   Pilote un binaire Stockfish natif (installé via apt-get dans le
   runner GitHub Actions) en parlant directement le protocole UCI.
   Un seul processus est réutilisé pour toute l'analyse d'un run,
   ce qui est bien plus rapide que d'en relancer un par coup.
   ============================================================ */
const { spawn } = require('child_process');

class StockfishEngine {
  constructor(binaryPath){
    this.binaryPath = binaryPath || process.env.STOCKFISH_PATH || 'stockfish';
    this.proc = spawn(this.binaryPath);
    this.buffer = '';
    this._lineHandler = null;
    this.proc.stdout.setEncoding('utf8');
    this.proc.stdout.on('data', chunk => this._onData(chunk));
    this.proc.on('error', (err) => {
      console.error(`Impossible de démarrer Stockfish (${this.binaryPath}) :`, err.message);
    });
  }

  _send(cmd){ this.proc.stdin.write(cmd + '\n'); }

  _onData(chunk){
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();
    for(const raw of lines){
      const line = raw.trim();
      if(line && this._lineHandler) this._lineHandler(line);
    }
  }

  _waitFor(predicate, timeoutMs = 15000){
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this._lineHandler = null; reject(new Error('Timeout Stockfish')); }, timeoutMs);
      this._lineHandler = (line) => {
        if(predicate(line)){ clearTimeout(timer); this._lineHandler = null; resolve(line); }
      };
    });
  }

  async ready(skillLevel = 20){
    this._send('uci');
    await this._waitFor(l => l === 'uciok');
    this._send(`setoption name Skill Level value ${skillLevel}`);
    this._send('isready');
    await this._waitFor(l => l === 'readyok');
  }

  /** Analyse une position FEN pendant `movetimeMs` ms.
   *  Retourne { bestMoveUci, scoreCp, mate } — score/mate du point de
   *  vue du camp au trait dans le FEN fourni (convention UCI standard). */
  analyze(fen, movetimeMs = 400){
    return new Promise((resolve, reject) => {
      let scoreCp = null, mate = null;
      const timer = setTimeout(() => { this._lineHandler = null; reject(new Error('Timeout analyse Stockfish')); }, movetimeMs + 10000);
      this._lineHandler = (line) => {
        if(line.startsWith('info') && line.includes(' score ')){
          const cpMatch = line.match(/score cp (-?\d+)/);
          const mateMatch = line.match(/score mate (-?\d+)/);
          if(mateMatch){ mate = parseInt(mateMatch[1], 10); scoreCp = null; }
          else if(cpMatch){ scoreCp = parseInt(cpMatch[1], 10); mate = null; }
        }
        if(line.startsWith('bestmove')){
          clearTimeout(timer);
          this._lineHandler = null;
          const parts = line.split(' ');
          const bestMoveUci = parts[1] && parts[1] !== '(none)' ? parts[1] : null;
          resolve({ bestMoveUci, scoreCp, mate });
        }
      };
      this._send(`position fen ${fen}`);
      this._send(`go movetime ${movetimeMs}`);
    });
  }

  quit(){
    try{ this._send('quit'); }catch(e){}
    setTimeout(() => { try{ this.proc.kill(); }catch(e){} }, 500);
  }
}

module.exports = { StockfishEngine };
