from rest_framework.viewsets import ViewSet
from .createUserView import CreateUserView
from .createTeacherView import CreateTeacherView
from .deleteUserView import DeleteUserView
from .updateUserView import UpdateUserView
from .getUserView import GetUserView
from .validateUserView import ValidateUserView


class MasterUserViewSet(
    CreateUserView,
    CreateTeacherView,
    DeleteUserView,
    UpdateUserView,
    GetUserView,
    ValidateUserView,
):
    """
    This is a Master class that aggregates functionalities from multiple ViewSet classes.

    Inherits From:
        AddUserView: For adding new Users.
        GetUserView: For retrieving User(s).
        UpdateUserView: For updating User details.
        ValidateUserView: For validating User password.
        DeleteUserView: For deleting a User.

    Note:
        The 'pass' keyword is used as this class serves as a container for the other classes
        and does not need to have its own methods or attributes.
    """

    pass
