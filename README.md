### Requirements
1. search
   - hybrid search
     - [x] full-text search
     - [x] vector search
   - [x] display pdf file
2. community
   - [x] newfeeds
   - interact with posts ***(authenticated)***
     - [x] like
     - [x] comment
     - [ ] share
   - [ ] search posts by content
   - [x] post content ***(authenticated)***
     - [ ] toxic content detection
3. assistant ***(authenticated)***
   - [x] question & answer
   - [ ] clickable citation
4. map
   - [x] navigation
   - [ ] available area: instant response
   - unavailable area ***(authenticated)***
     - [ ] create inference request
     - [ ] store result
5. user profile ***(authenticated)***
   - [ ] follower, following
   - [ ] contacts
   - [ ] posts
### Prerequisites
1. azure services
   - [x] azure blob storage
   - [x] azure cosmos
   - [x] azure ai search
   - [x] azure foundry
2. google cloud services
   - [x] google earth engine: non-comercial plan
   - [x] google storage: east-us bucket 
3. search
   - azure blob storage
     - [x] create container
     - [ ] upload documents
   - azure foundry
     - [x] deploy a text embedding model
4. community
   - azure cosmos
     - [x] create database: vinacarbon
     - [x] create container: posts
        - partition: /id
        - full-text-search: /content
5. assistant
   - azure foundry
     - [ ] create agent
       - meta: name, description, starter prompt
       - instructions
       - tool = file search
        - [ ] upload documents
6. map
   - [x] collect data
     - [x] sample data
       - footprints: Vietnam-2024
       - patches: footprints >= 10%
     - [x] group patches by region
     - [x] download patches: sen1, sen2-10m, sen2-20m, sen2-60, gedi-agbd
   - [ ] train model
   - [ ] validation
   - [x] inference