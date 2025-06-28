defmodule CodinCod.Repo.Migrations.CreatePuzzleVotes do
  use Ecto.Migration

  def change do
    create table(:puzzle_votes) do

      add :type, :string
      add :user, references(:user)
      add :puzzle, references(:puzzle)

      timestamps(type: :utc_datetime)
    end
  end
end

# const authorSchema = z.union([objectIdSchema, userDtoSchema]);

# export const commentEntitySchema = z.object({
# 	author: authorSchema,
# 	text: z
# 		.string()
# 		.min(COMMENT_CONFIG.minTextLength)
# 		.max(COMMENT_CONFIG.maxTextLength),
# 	upvote: z.number().int().min(0).default(0),
# 	downvote: z.number().int().min(0).default(0),
# 	createdAt: acceptedDateSchema.optional(),
# 	updatedAt: acceptedDateSchema.optional(),
# 	commentType: commentTypeSchema,
# 	comments: z.array(objectIdSchema),
# 	parentId: objectIdSchema,
# });

# export type CommentEntity = z.infer<typeof commentEntitySchema>;
