// src/components/Admin/EventLogs.js
const EventLogs = ({ logs }) => (
    <List>
      {logs.map(log => (
        <ListItem key={log.id}>
          <Typography>
            [{log.timestamp}] {log.message}
          </Typography>
        </ListItem>
      ))}
    </List>
  );