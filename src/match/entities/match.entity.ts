import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { MatchNumber } from './match-number.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: false })
  closed!: boolean;

  @Column({ default: 1 })
  soldCards!: number;

  @ManyToOne(() => Room, (room) => room.matches, { onDelete: 'CASCADE' })
  room!: Room;

  @OneToMany(() => MatchNumber, (matchNumber) => matchNumber.match, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  matchNumbers?: MatchNumber[];
}
