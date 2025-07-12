import { Observable } from 'rxjs';
import { stackInfo } from '../drawing-tools/types/stack-info.type';
import { StackType } from '../drawing-tools/types/stack.type';

export interface StackServiceInterface {
  getPaths(): stackInfo[];
  pushStack(path: stackInfo | null, stack: StackType): void;
  popStack(stack: StackType): stackInfo | undefined;
  resetStack(stack: StackType): void;

  readonly canUndo: boolean;
  readonly canRedo: boolean;

  updateFigurePath(
    name: string,
    newPath: { x: number; y: number; color: string }[]
  ): void;

  pathsChanged$?: Observable<void>;
}
