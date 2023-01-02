import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Match } from '../../match/entities/match.entity';
import { RoomPrize } from './room-prize.entity';

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @ManyToOne(() => User, (user) => user.rooms, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  owner!: User;

  @Column({ type: 'datetime', default: () => 'NOW' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: null })
  startedAt!: Date;

  @OneToMany(() => Match, (match) => match.room, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  matches?: Match[];

  @ManyToMany(() => User)
  @JoinTable()
  currentUsers!: User[];

  @OneToOne(() => Match, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  currentMatch!: Match;

  @Column({ default: 0.5, type: 'float', scale: 2 })
  ticketPrice!: number;

  @OneToOne(() => RoomPrize, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  roomPrize!: RoomPrize;
}
