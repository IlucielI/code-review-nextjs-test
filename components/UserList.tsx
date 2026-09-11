interface User {
  id: string
  name: string
  email: string
}

interface UserListProps {
  users: User[]
}

export default function UserList({ users }: UserListProps) {
  // This is frontend rendering - should NOT trigger N+1 detection
  return (
    <div className="user-list">
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <div className="user-card">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
