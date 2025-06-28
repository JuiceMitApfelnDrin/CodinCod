# defmodule CodinCod.Comment do
#   use Ecto.Schema
#   import Ecto.Changeset
#   alias CodinCod.Accounts.User
#   alias CodinCod.Comment
#   alias CodinCod.Puzzle

#   schema "comments" do
#     belongs_to :user, User
#     belongs_to :comment, Comment
#     has_many :comments, Comment
#     has_one :puzzle, Puzzle

#     field :content, :string

#     timestamps(type: :utc_datetime)
#   end

#   @doc false
#   def changeset(comment, attrs) do
#     comment
#     |> cast(attrs, [:text])
#     |> validate_required([:text])
#   end
# end

# # export const commentEntitySchema = z.object({
# # 	upvote: z.number().int().min(0).default(0),
# # 	downvote: z.number().int().min(0).default(0),
# # 	createdAt: acceptedDateSchema.optional(),
# # 	updatedAt: acceptedDateSchema.optional(),
# # 	commentType: commentTypeSchema,
# # 	comments: z.array(objectIdSchema),
# # 	parentId: objectIdSchema,
# # });

# # export type CommentEntity = z.infer<typeof commentEntitySchema>;
