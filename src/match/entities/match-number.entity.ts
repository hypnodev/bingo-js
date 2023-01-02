import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class MatchNumber {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  number!: number;

  @ManyToOne(() => Match, (match) => match.matchNumbers, {
    onDelete: 'CASCADE',
  })
  match!: Match;
}
