import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MatchService } from '../match.service';
import { MATCH_NUMBER_EXTRACTION_DELAY } from '../consts/match.const';

@Processor('matches')
export class MatchesConsumer {
  private matchesTimer = [];

  constructor(private readonly matchService: MatchService) {}

  @Process()
  async extractNumber(job: Job<unknown>) {
    const { match, roomId } = job.data as any;

    this.matchesTimer[roomId] = setInterval(async () => {
      const extractedNumber = await this.matchService.extractNumber(match);

      if (extractedNumber === 0) {
        return;
      }

      if (extractedNumber === null && this.matchesTimer[roomId]) {
        clearInterval(this.matchesTimer[roomId]);
      }
    }, MATCH_NUMBER_EXTRACTION_DELAY);

    return {};
  }
}
