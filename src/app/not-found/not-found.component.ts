import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
  rotation: number;
  spin: number;
}

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  imports: [TranslateModule],
})
export class NotFoundComponent implements AfterViewInit {
  private spawnPerSec = 100;

  @ViewChild('notFoundCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('octagon', { static: true }) octagonRef!: ElementRef<HTMLDivElement>;
  @ViewChild('question', { static: true }) questionRef!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];

  private symbols = [
    'π','x','y','z','θ','λ','μ','α','β','γ','Δ','∑','√','∞',
    '+','−','×','÷','=','≈','≠','≤','≥','∫','∂'
  ];

  private smallPolygon = [
    {x:35, y:15},{x:65, y:15},{x:85, y:35},{x:85, y:65},
    {x:65, y:85},{x:35, y:85},{x:15, y:65},{x:15, y:35}
  ];

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    this.ctx = canvas.getContext('2d')!;

    setInterval(() => this.spawnParticle(), 1000 / this.spawnPerSec);
    requestAnimationFrame(() => this.loop());

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private spawnParticle() {
    const canvas = this.canvasRef.nativeElement;
    const oct = this.octagonRef.nativeElement;

    const rect = oct.getBoundingClientRect();

    const scaleX = rect.width / 100;
    const scaleY = rect.height / 100;

    const offsetX = rect.left;
    const offsetY = rect.top;

    const n = this.smallPolygon.length;
    const edgeIndex = Math.floor(Math.random() * n);
    const p1 = this.smallPolygon[edgeIndex];
    const p2 = this.smallPolygon[(edgeIndex + 1) % n];

    const t = Math.random();

    const x = (p1.x + (p2.x - p1.x) * t) * scaleX + offsetX;
    const y = (p1.y + (p2.y - p1.y) * t) * scaleY + offsetY;

    const dxEdge = p2.x - p1.x;
    const dyEdge = p2.y - p1.y;

    let nx = -dyEdge;
    let ny = dxEdge;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = x - cx;
    const dy = y - cy;

    if (nx * dx + ny * dy < 0) {
      nx = -nx;
      ny = -ny;
    }

    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len;
    ny /= len;

    const angle = (Math.random() - 0.5) * 0.7;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rx = nx * cos - ny * sin;
    const ry = nx * sin + ny * cos;

    nx = rx;
    ny = ry;

    const speed = 2 + Math.random() * 2;

    const life = 150 + Math.random() * 110;

    this.particles.push({
      x,
      y,
      vx: nx * speed,
      vy: ny * speed,
      life,
      maxLife: life,
      char: this.symbols[Math.floor(Math.random() * this.symbols.length)],
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.1
    });
  }

  private loop() {
    const canvas = this.canvasRef.nativeElement;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.fillStyle = '#c444ff';
    this.ctx.font = '16px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.rotation += p.spin;

      const moveAngle = Math.atan2(p.vy, p.vx);
      const alpha = p.life / p.maxLife;

      if (alpha <= 0.02) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();

      this.ctx.globalAlpha = alpha;

      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(moveAngle + p.rotation);
      this.ctx.shadowColor = '#c444ff';
      this.ctx.shadowBlur = 12;

      this.ctx.fillText(p.char, 0, 0);
      this.ctx.restore();

      if (p.life <= 0) this.particles.splice(i, 1);
    }

    requestAnimationFrame(() => this.loop());
  }

  private onMouseMove(event: MouseEvent) {

    const oct = this.octagonRef.nativeElement;
    const question = this.questionRef.nativeElement;

    const rect = oct.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (event.clientX - centerX) / (rect.width / 2);
    const dy = (event.clientY - centerY) / (rect.height / 2);

    const clampX = Math.max(-1, Math.min(1, dx));
    const clampY = Math.max(-1, Math.min(1, dy));

    const rotateY = clampX * 45;
    const rotateX = -clampY * 45;

    question.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
}