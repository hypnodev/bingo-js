import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class RoomPrize {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'float', scale: 2, default: 0 })
  onePrice!: number;

  @Column({ default: 0 })
  oneBalls!: number;

  @Column({ type: 'float', scale: 2, default: 0 })
  superPrice!: number;

  @Column({ default: 0 })
  superBalls!: number;

  @Column({ type: 'float', scale: 2, default: 0 })
  bronzePrice!: number;

  @Column({ default: 0 })
  bronzeBalls!: number;

  @OneToOne(() => Room, { onDelete: 'CASCADE' })
  room!: Room;
}
