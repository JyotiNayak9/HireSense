import RankingResult from '@/database/RankingResult.model';

export async function refreshJobRecommendationRanks(jobId: string) {
  const results = await RankingResult.find({ jobId }).sort({ score: -1, createdAt: 1 });

  if (results.length === 0) {
    return 0;
  }

  await RankingResult.bulkWrite(
    results.map((result, index) => ({
      updateOne: {
        filter: { _id: result._id },
        update: {
          $set: {
            rank: index + 1,
            isRecommended: index < 3,
          },
        },
      },
    }))
  );

  return results.length;
}
