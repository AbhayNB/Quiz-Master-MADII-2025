from flask import Flask
from flask_graphql import GraphQLView
import graphene

# Define your data models
class Author(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()
    books = graphene.List(lambda: Book)

class Book(graphene.ObjectType):
    id = graphene.ID()
    title = graphene.String()
    author = graphene.Field(Author)

# Sample data
authors_data = [
    {"id": 1, "name": "F. Scott Fitzgerald"},
    {"id": 2, "name": "George Orwell"}
]

books_data = [
    {"id": 1, "title": "The Great Gatsby", "author_id": 1},
    {"id": 2, "title": "1984", "author_id": 2}
]

# Define your queries
class Query(graphene.ObjectType):
    books = graphene.List(Book)
    authors = graphene.List(Author)

    def resolve_books(self, info):
        return [Book(id=book["id"], title=book["title"], author=self.get_author(book["author_id"])) for book in books_data]

    def resolve_authors(self, info):
        return [Author(id=author["id"], name=author["name"]) for author in authors_data]

    def get_author(self, author_id):
        author = next((author for author in authors_data if author["id"] == author_id), None)
        return Author(id=author["id"], name=author["name"]) if author else None

# Create a schema
schema = graphene.Schema(query=Query)

# Create a Flask app
app = Flask(__name__)

# Add the GraphQL endpoint
app.add_url_rule('/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

if __name__ == '__main__':
    app.run(debug=True)
